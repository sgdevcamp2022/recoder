package com.recoder.presentation.model

import com.recoder.presentation.ui.meeting.RoomClient

data class RoomInfo(
    var url: String? = null,
    var roomId: String? = null,
    var connectionState: RoomClient.ConnectionState = RoomClient.ConnectionState.NEW,
    var activeSpeakerId: String? = null,
    var statsPeerId: String? = null,
    var isFaceDetection: Boolean = false,
    var peerCount: Int = 0,
)

