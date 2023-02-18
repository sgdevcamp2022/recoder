package com.recoder.presentation.ui.meeting

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel


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

//		val remoteVideoTrack = roomClient.
//		val localVideoTrack = localVideoTrackState

//		if (remoteVideoTrack != null) {
//			VideoRenderer(
//				videoTrack = remoteVideoTrack,
//				modifier = Modifier
//					.fillMaxSize()
//					.onSizeChanged { parentSize = it }
//			)
//		}
//
//		if (localVideoTrack != null) {
//			FloatingVideoRenderer(
//				modifier = Modifier
//					.size(width = 150.dp, height = 210.dp)
//					.clip(RoundedCornerShape(16.dp))
//					.align(Alignment.TopEnd),
//				videoTrack = localVideoTrack,
//				parentBounds = parentSize,
//				paddingValues = PaddingValues(0.dp)
//			)
//		}
//
//		val activity = (LocalContext.current as? Activity)
//		var callMediaState by remember { mutableStateOf(CallMediaState()) }
//
//		VideoCallControls(
//			modifier = Modifier
//				.fillMaxWidth()
//				.align(Alignment.BottomCenter),
//			callMediaState = callMediaState,
//			onCallAction = {
//				when (it) {
//					is CallAction.ToggleMicroPhone -> {
//						val enabled = callMediaState.isMicrophoneEnabled.not()
//						callMediaState = callMediaState.copy(isMicrophoneEnabled = enabled)
//						sessionManager.enableMicrophone(enabled)
//					}
//					is CallAction.ToggleCamera -> {
//						val enabled = callMediaState.isCameraEnabled.not()
//						callMediaState = callMediaState.copy(isCameraEnabled = enabled)
//					}
//					CallAction.FlipCamera -> sessionManager.flipCamera()
//					CallAction.LeaveCall -> {
//						sessionManager.disconnect()
//						activity?.finish()
//					}
//				}
//			}
//		)
	}
}