package com.recoder.presentation.ui.home

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import by.kirich1409.viewbindingdelegate.viewBinding
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentJoinByCodeBinding
import com.recoder.presentation.ui.MainActivity


class JoinByCodeFragment : Fragment() {

    companion object {
        fun newInstance() = JoinByCodeFragment()
    }

    private lateinit var viewModel: JoinByCodeViewModel
    private val binding by viewBinding(FragmentJoinByCodeBinding::bind)
    private lateinit var mainActivity : MainActivity

    override fun onAttach(context: Context) {
        super.onAttach(context)
        mainActivity = context as MainActivity
    }
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_join_by_code, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

    }



}