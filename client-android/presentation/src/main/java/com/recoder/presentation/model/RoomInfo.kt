package com.recoder.presentation.ui.meeting

data class RoomInfo(
	var url: String? = null,
	var roomId: String? = null,
	var connectionState: RoomClient.ConnectionState = RoomClient.ConnectionState.NEW,
	var activeSpeakerId: String? = null,
	var statsPeerId: String? = null,
	var isFaceDetection: Boolean = false,
)

