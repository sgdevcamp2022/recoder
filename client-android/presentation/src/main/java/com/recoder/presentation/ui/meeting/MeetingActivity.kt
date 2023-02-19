package com.recoder.presentation.ui.meeting

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.recoder.presentation.ui.meeting.ui.theme.ComeetandroidTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MeetingActivity @Inject constructor() : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {

        requestPermissions(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO), 0)

        super.onCreate(savedInstanceState)
        setContent {
            ComeetandroidTheme {
                var onCallScreen by remember { mutableStateOf(false) }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colors.background
                ) {
                    var onCallScreen by remember { mutableStateOf(false) }

                    if (!onCallScreen) {
                        Button(onClick = { onCallScreen = true }) { Text("시작하기") }
                    } else {
                        MeetingScreen(
                            RoomClient(
                                this,
                                intent.getStringExtra("link") ?: ""
                            )
                        )
                    }
                }
            }
        }
    }
}