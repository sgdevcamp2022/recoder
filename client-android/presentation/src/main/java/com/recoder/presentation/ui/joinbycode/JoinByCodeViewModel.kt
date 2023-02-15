package com.recoder.presentation.ui.joinbycode

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.recoder.domain.usecase.CreateLinkUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class JoinByCodeViewModel @Inject constructor(
) : ViewModel() {

	val enteredCode = MutableStateFlow<String?>(null)

}