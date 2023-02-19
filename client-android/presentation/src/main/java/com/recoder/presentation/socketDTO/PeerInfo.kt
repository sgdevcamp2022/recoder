package com.recoder.presentation.socketDTO

import kotlinx.serialization.Serializable

@Serializable
data class PeerInfo(
    val peer_name: String = "undefined",
    val peer_id: String = "",
    val room_id: String = "",
    var peer_audio: Boolean = false,
    var peer_video: Boolean = false,
    var peer_screen: Boolean = false,
    var peer_hand: Boolean = false,
)