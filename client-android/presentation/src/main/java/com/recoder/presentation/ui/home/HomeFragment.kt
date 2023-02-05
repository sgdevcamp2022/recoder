package com.recoder.presentation.ui.home

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.findNavController
import by.kirich1409.viewbindingdelegate.viewBinding
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentHomeBinding
import com.recoder.presentation.ui.MainActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class HomeFragment : Fragment() {

    private val binding by viewBinding(FragmentHomeBinding::bind)
    private lateinit var mainActivity : MainActivity

    override fun onAttach(context: Context) {
        super.onAttach(context)
        mainActivity = context as MainActivity
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnJoinByCode.setOnClickListener {
            it.findNavController().navigate(R.id.action_home_fragment_to_join_by_code_fragment)
        }

        binding.btnNewMeeting.setOnClickListener {
            it.findNavController().navigate(R.id.action_home_fragment_to_new_meeting_bottom_sheet)
        }
    }
}