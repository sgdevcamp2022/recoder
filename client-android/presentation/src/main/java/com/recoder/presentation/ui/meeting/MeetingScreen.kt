package com.recoder.presentation.ui.meeting

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.recoder.presentation.ui.meeting.video.CallAction
import com.recoder.presentation.ui.meeting.video.CallMediaState
import com.recoder.presentation.ui.meeting.video.FloatingVideoRenderer
import io.getstream.webrtc.sample.compose.ui.screens.video.VideoCallControls

@Composable
fun MeetingScreen(
    roomClient: RoomClient,
//	vm : MeetingViewModel = hiltViewModel()
) {

    LaunchedEffect(Unit) {}

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        var parentSize: IntSize by remember { mutableStateOf(IntSize(0, 0)) }

//		if (roomClient.remoteVideoTrack != null) {
//			VideoRenderer(
//				videoTrack = remoteVideoTrack,
//				modifier = Modifier
//					.fillMaxSize()
//					.onSizeChanged { parentSize = it }
//			)
//		}

        if (roomClient.localVideoTrack != null) {
            FloatingVideoRenderer(
                modifier = Modifier
                    .size(width = 150.dp, height = 210.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .align(Alignment.TopEnd),
                videoTrack = roomClient.localVideoTrack!!,
                parentBounds = parentSize,
                paddingValues = PaddingValues(0.dp)
            )
        }
//
        val activity = (LocalContext.current as? Activity)
        var callMediaState by remember { mutableStateOf(CallMediaState()) }
//
        VideoCallControls(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter),
            callMediaState = callMediaState,
            onCallAction = {
                when (it) {
                    is CallAction.ToggleMicroPhone -> {
                        val enabled = callMediaState.isMicrophoneEnabled.not()
                        callMediaState = callMediaState.copy(isMicrophoneEnabled = enabled)
                        // sessionManager.enableMicrophone(enabled)
                    }
                    is CallAction.ToggleCamera -> {
                        val enabled = callMediaState.isCameraEnabled.not()
                        callMediaState = callMediaState.copy(isCameraEnabled = enabled)
                    }
                    CallAction.FlipCamera -> {

                    }
                    CallAction.LeaveCall -> {
                        roomClient.exitRoom()
                        activity?.finish()
                    }
                    CallAction.FlipCamera -> TODO()
                    CallAction.LeaveCall -> TODO()
                    is CallAction.ToggleCamera -> TODO()
                    is CallAction.ToggleMicroPhone -> TODO()
                }
            }
        )
    }
}