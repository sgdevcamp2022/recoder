package com.recoder.presentation.ui.newmeeting

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import by.kirich1409.viewbindingdelegate.viewBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.snackbar.Snackbar
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentHomeBottomSheetBinding
import com.recoder.presentation.ui.util.repeatOnStarted
import com.recoder.presentation.ui.waiting.WaitingRoomActivity
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class HomeBottomSheetFragment : BottomSheetDialogFragment() {

    private val binding by viewBinding(FragmentHomeBottomSheetBinding::bind)
    private val viewModel: HomeBottomSheetViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_home_bottom_sheet, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.apply {
            lifecycleOwner = viewLifecycleOwner
            vm = viewModel
        }
        collectEvent()
    }

    private fun collectEvent() {
        repeatOnStarted {
            viewModel.eventFlow.collect { event ->
                when (event) {
                    HomeBottomSheetEvent.NavigateToWaitingRoom -> moveToWaitingRoom()
                    HomeBottomSheetEvent.ShowLinkDialog -> showLinkDialog()
                    is HomeBottomSheetEvent.ShowSnackBar -> showSnackBar(event.msg)
                }
            }
        }
    }

    private fun showLinkDialog() {
        Timber.d(viewModel.createdCode)
    }

    private fun showSnackBar(message: String) =
        Snackbar.make(binding.root, message, Snackbar.LENGTH_SHORT).show()

    private fun moveToWaitingRoom() {
        startWaitingRoomActivity()
    }

    private fun startWaitingRoomActivity() {
        val intent = Intent(requireContext(), WaitingRoomActivity::class.java)
        intent.putExtra("code", viewModel.createdCode)
        startActivity(intent)
    }
}