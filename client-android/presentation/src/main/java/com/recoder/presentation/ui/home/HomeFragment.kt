package com.recoder.presentation.ui.home

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.viewModels
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import by.kirich1409.viewbindingdelegate.viewBinding
import com.google.android.material.snackbar.Snackbar
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentHomeBinding
import com.recoder.presentation.ui.util.repeatOnStarted
import com.recoder.presentation.ui.waiting.WaitingRoomActivity
import dagger.hilt.android.AndroidEntryPoint

class HomeFragment : Fragment() {

    private val binding by viewBinding(FragmentHomeBinding::bind)
    private val viewModel: HomeViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.apply {
            lifecycleOwner = viewLifecycleOwner
            vm = viewModel
        }
        initNavigateAction()
        collectEffect()
    }

    private fun collectEffect() {
        repeatOnStarted {
            viewModel.effect.collect { effect ->
                when(effect) {
                    HomeContract.HomeUiSideEffect.MoveToWaitingRoom -> moveToWaitingRoom()
                    HomeContract.HomeUiSideEffect.ShowSnackBar -> showSnackBar(viewModel.uiState.value.snackBarText)
                }
            }
        }
    }

    private fun initNavigateAction() {
        binding.btnNewMeeting.setOnClickListener {
            it.findNavController().navigate(R.id.action_home_fragment_to_new_meeting_bottom_sheet)
        }
        binding.btnJoinByCode.setOnClickListener {
            it.findNavController().navigate(R.id.action_home_fragment_to_join_by_code_fragment)
        }
    }

    private fun moveToWaitingRoom() {
        val intent = Intent(requireContext(), WaitingRoomActivity::class.java)
        startActivity(intent)
    }
    private fun showSnackBar(text: String) =
        Snackbar.make(binding.root, text, Snackbar.LENGTH_SHORT).show()
}