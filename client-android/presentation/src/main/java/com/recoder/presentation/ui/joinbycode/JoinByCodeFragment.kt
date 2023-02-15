package com.recoder.presentation.ui.joinbycode

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import androidx.fragment.app.Fragment
import by.kirich1409.viewbindingdelegate.viewBinding
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentJoinByCodeBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class JoinByCodeFragment : Fragment() {

    private val binding by viewBinding(FragmentJoinByCodeBinding::bind)
    private lateinit var mInputMethodManager: InputMethodManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_join_by_code, container, false)
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.codeTextField.requestFocus()
        mInputMethodManager = requireContext().getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        mInputMethodManager.showSoftInput(binding.codeTextField, InputMethodManager.SHOW_IMPLICIT)
    }

}