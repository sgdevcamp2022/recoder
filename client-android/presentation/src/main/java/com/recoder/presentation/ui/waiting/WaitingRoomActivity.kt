package com.recoder.presentation.ui.waiting

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.commit
import com.recoder.presentation.R
import com.recoder.presentation.databinding.ActivityWaitingRoomBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class WaitingRoomActivity : AppCompatActivity() {

	private lateinit var binding: ActivityWaitingRoomBinding
	private val waitingRoomFragment by lazy { WaitingRoomFragment() }

	override fun onCreate(savedInstanceState: Bundle?) {
		installSplashScreen()
		super.onCreate(savedInstanceState)
		binding = DataBindingUtil.setContentView(this, R.layout.activity_waiting_room)
		supportFragmentManager.commit {
			add(R.id.fcv_waiting_room, waitingRoomFragment)
		}
	}
}