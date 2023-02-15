package com.recoder.presentation.ui.newmeeting

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.recoder.domain.usecase.CreateLinkUseCase
import com.recoder.presentation.ui.util.MutableEventFlow
import com.recoder.presentation.ui.util.asEventFlow
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject

@HiltViewModel
class HomeBottomSheetViewModel @Inject constructor(
	private val createLinkUseCase: CreateLinkUseCase,
) : ViewModel() {

	private val _eventFlow = MutableEventFlow<HomeBottomSheetEvent>()
	val eventFlow = _eventFlow.asEventFlow()

	var createdCode : String? = null

	private suspend fun makeNewMeeting() = withContext(viewModelScope.coroutineContext) {
		createLinkUseCase()
			.onSuccess { createdCode = it }
			.onFailure {
				createdCode = null
				Timber.d(it.message)
				_eventFlow.emit(HomeBottomSheetEvent.ShowSnackBar("회의실 생성에 실패했습니다"))
			}
	}

	fun showNewLinkDialog() = viewModelScope.launch {
		makeNewMeeting()
		if(!createdCode.isNullOrEmpty()) {
			_eventFlow.emit(HomeBottomSheetEvent.ShowLinkDialog)
		}
	}

	fun startMeetingNow() = viewModelScope.launch {
		makeNewMeeting()
		if(!createdCode.isNullOrEmpty()) {
			_eventFlow.emit(HomeBottomSheetEvent.NavigateToWaitingRoom)
		}
	}
}