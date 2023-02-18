package com.recoder.presentation.ui.meeting

import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CameraMetadata
import androidx.core.content.getSystemService
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.recoder.domain.usecase.CreateLinkUseCase
import com.recoder.presentation.ui.util.timber
import com.recoder.presentation.ui.util.toJsonObject
import dagger.hilt.android.lifecycle.HiltViewModel
import io.socket.client.Ack
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import org.json.JSONException
import org.json.JSONObject
import org.mediasoup.droid.Device
import org.mediasoup.droid.RecvTransport
import org.mediasoup.droid.SendTransport
import org.mediasoup.droid.Transport
import org.webrtc.*
import timber.log.Timber
import javax.inject.Inject

@HiltViewModel
class MeetingViewModel @Inject constructor(
	private val createLinkUseCase: CreateLinkUseCase,
) : ViewModel() {

	private lateinit var socket: Socket
	private lateinit var device: Device
	private lateinit var producerTransport: SendTransport
	private lateinit var consumerTransport: RecvTransport



}





