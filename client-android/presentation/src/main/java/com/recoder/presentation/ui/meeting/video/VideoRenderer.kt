package com.recoder.presentation.ui.meeting.video

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.recoder.presentation.peer.PeerConnectionUtils.getEglContext
import org.webrtc.RendererCommon
import org.webrtc.VideoTrack

/**
 * Renders a single video track based on the call state.
 *
 * @param videoTrack The track containing the video stream for a given participant.
 * @param modifier Modifier for styling.
 */
@Composable
fun VideoRenderer(
    videoTrack: VideoTrack,
    modifier: Modifier = Modifier,
) {
    val trackState: MutableState<VideoTrack?> = remember { mutableStateOf(null) }
    var view: TextureViewRenderer? by remember { mutableStateOf(null) }

    DisposableEffect(videoTrack) {
        onDispose {
            cleanTrack(view, trackState)
        }
    }

    AndroidView(
        factory = { context ->
            TextureViewRenderer(context).apply {
                init(
                    getEglContext(),
                    object : RendererCommon.RendererEvents {
                        override fun onFirstFrameRendered() = Unit

                        override fun onFrameResolutionChanged(p0: Int, p1: Int, p2: Int) = Unit
                    }
                )
                setupVideo(trackState, videoTrack, this)
                view = this
            }
        },
        update = { v -> setupVideo(trackState, videoTrack, v) },
        modifier = modifier
    )
}

private fun cleanTrack(
    view: TextureViewRenderer?,
    trackState: MutableState<VideoTrack?>,
) {
    view?.let { trackState.value?.removeSink(it) }
    trackState.value = null
}

private fun setupVideo(
    trackState: MutableState<VideoTrack?>,
    track: VideoTrack,
    renderer: TextureViewRenderer,
) {
    if (trackState.value == track) {
        return
    }

    cleanTrack(renderer, trackState)

    trackState.value = track
    track.addSink(renderer)
}
