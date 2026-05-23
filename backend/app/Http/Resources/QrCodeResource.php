<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrCodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'url' => $this->url,
            'public_url' => $this->url,
            'qr_value' => $this->url,
            'payload' => $this->payload,
            'scan_count' => $this->scan_count,
        ];
    }
}
