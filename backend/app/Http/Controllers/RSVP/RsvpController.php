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
use App\Services\RsvpService;
use Illuminate\Http\JsonResponse;

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
        $guest = $this->rsvps->submit($event, $request->validated());

        return $this->success('RSVP submitted successfully', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->rsvps->stats($event->refresh()),
        ], 201);
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
