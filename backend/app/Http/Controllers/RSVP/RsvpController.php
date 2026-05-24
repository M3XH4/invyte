<?php

namespace App\Http\Controllers\RSVP;

use App\Http\Controllers\ApiController;
use App\Http\Requests\RSVP\StoreRsvpQuestionRequest;
use App\Http\Requests\RSVP\SubmitRsvpRequest;
use App\Http\Resources\EventGuestResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\PublicEventResource;
use App\Http\Resources\RsvpQuestionResource;
use App\Models\Event;
use App\Models\RsvpQuestion;
use App\Services\ActivityLogService;
use App\Services\EventPermissionService;
use App\Services\RsvpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RsvpController extends ApiController
{
    public function __construct(
        private readonly RsvpService $rsvps,
        private readonly ActivityLogService $activityLogs,
    )
    {
    }

    public function publicShow(string $slug): JsonResponse
    {
        return $this->success('Public event loaded', new PublicEventResource($this->rsvps->publicEvent($slug)));
    }

    public function publicSubmit(SubmitRsvpRequest $request, string $slug): JsonResponse
    {
        $event = $this->rsvps->publicEvent($slug);
        $user = $request->user('sanctum');
        $email = $request->validated('email') ?: $user?->email;
        $existing = $this->rsvps->existingRsvp($event, $user, $email);

        if ($existing) {
            return response()->json([
                'success' => false,
                'code' => 'ALREADY_RESPONDED',
                'message' => 'You have already responded to this event.',
                'data' => [
                    'event' => new PublicEventResource($event),
                    'guest' => new EventGuestResource($existing),
                ],
            ], 409);
        }

        $payload = $request->validated();
        $payload['name'] = $payload['name'] ?? $user?->name;
        $payload['email'] = $payload['email'] ?? $user?->email;

        $guest = $this->rsvps->submit($event, $payload, $user);

        return $this->success('RSVP submitted successfully', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->rsvps->stats($event->refresh()),
            'event' => new PublicEventResource($event->refresh()->load(['questions', 'guests', 'qrCode'])),
        ], 201);
    }

    public function myRsvp(Request $request, string $slug): JsonResponse
    {
        $event = $this->rsvps->publicEvent($slug);
        $user = $request->user('sanctum');
        $guest = $this->rsvps->existingRsvp($event, $user, $request->query('email'));

        return $this->success('RSVP status loaded', [
            'already_responded' => (bool) $guest,
            'event' => new PublicEventResource($event),
            'guest' => $guest ? new EventGuestResource($guest) : null,
        ]);
    }

    public function preview(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return $this->success('RSVP preview loaded', new EventResource($event->load(['category', 'theme', 'qrCode', 'questions'])));
    }

    public function stats(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return $this->success('RSVP stats loaded', $this->rsvps->stats($event));
    }

    public function myEventRsvp(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $guest = $this->rsvps->ownRsvp($event, $request->user());
        abort_unless($guest, 404, 'RSVP not found for this event.');

        return $this->success('Your RSVP loaded', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->rsvps->stats($event),
            'permissions' => app(EventPermissionService::class)->forUser($event, $request->user()),
        ]);
    }

    public function updateMyEventRsvp(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $data = $request->validate([
            'response_status' => ['required', Rule::in(['going', 'maybe', 'not_going'])],
            'plus_ones' => ['nullable', 'integer', 'min:0', 'max:20'],
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required_with:answers', 'uuid', 'exists:rsvp_questions,id'],
            'answers.*.answer' => ['nullable'],
        ]);

        $guest = $this->rsvps->updateOwnRsvp($event, $request->user(), $data);
        $event->refresh();

        return $this->success('Your RSVP was updated', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->rsvps->stats($event),
            'activity_log' => $event->activityLogs()->latest()->first(),
            'permissions' => app(EventPermissionService::class)->forUser($event, $request->user()),
        ]);
    }

    public function questions(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return $this->success('RSVP questions loaded', RsvpQuestionResource::collection(
            $event->questions()->orderBy('sort_order')->get()
        ));
    }

    public function storeQuestion(StoreRsvpQuestionRequest $request, Event $event): JsonResponse
    {
        $this->authorize('manage', $event);

        $question = $this->rsvps->createQuestion($event, $request->validated());
        $this->activityLogs->record(
            $event,
            $request->user(),
            'rsvp_question_added',
            'RSVP question added',
            "A new RSVP question was added.",
            $question,
            ['question_id' => $question->id]
        );

        return $this->success('RSVP question created', new RsvpQuestionResource($question), 201);
    }

    public function destroyQuestion(RsvpQuestion $question): JsonResponse
    {
        $this->authorize('manage', $question->event);
        $event = $question->event;
        $questionId = $question->id;
        $this->rsvps->deleteQuestion($question);
        $this->activityLogs->record(
            $event,
            request()->user(),
            'rsvp_question_deleted',
            'RSVP question deleted',
            "An RSVP question was deleted.",
            null,
            ['question_id' => $questionId]
        );

        return $this->success('RSVP question deleted');
    }

    public function destroyEventQuestion(Event $event, RsvpQuestion $question): JsonResponse
    {
        abort_unless($question->event_id === $event->id, 404);

        return $this->destroyQuestion($question);
    }
}
