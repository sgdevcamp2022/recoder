package com.recoder.presentation.ui.waiting

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.recoder.presentation.R

class WaitingRoomFragment : Fragment() {

    companion object {
        fun newInstance() = WaitingRoomFragment()
    }

    private lateinit var viewModel: WaitingRoomViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_waiting_room, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(WaitingRoomViewModel::class.java)
        // TODO: Use the ViewModel
    }

}