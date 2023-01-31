package com.recoder.presentation.ui.home

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.recoder.presentation.R

class JoinByCodeFragment : Fragment() {

    companion object {
        fun newInstance() = JoinByCodeFragment()
    }

    private lateinit var viewModel: JoinByCodeViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        return inflater.inflate(R.layout.fragment_join_by_code, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(JoinByCodeViewModel::class.java)
        // TODO: Use the ViewModel
    }

}