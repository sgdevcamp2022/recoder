package com.recoder.presentation.socketDTO

import com.recoder.presentation.ui.meeting.MediaType

@kotlinx.serialization.Serializable
data class PeerUpdateInfo(
    val kind: String,
    val peer_id: String,
    val peer_name: String,
    val status: Boolean,
    val type: String,
) {
    val mediaType: MediaType = when (kind) {
        "audio" -> MediaType.AUDIO
        "video" -> MediaType.VIDEO
        "hand" -> MediaType.HAND
        else -> MediaType.NONE
    }
}