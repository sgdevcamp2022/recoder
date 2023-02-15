package com.recoder.presentation.ui.home

import com.recoder.presentation.ui.base.*

class HomeContract {

	data class HomeUiState(
		val snackBarText : String = "",
	) : UiState

	sealed class HomeUiSideEffect : UiSideEffect {
		object ShowSnackBar : HomeUiSideEffect()
		object MoveToWaitingRoom : HomeUiSideEffect()
	}

	sealed class HomeUiEvent : UiEvent {
		data class OnError(val msg : String) : HomeUiEvent()
	}
}