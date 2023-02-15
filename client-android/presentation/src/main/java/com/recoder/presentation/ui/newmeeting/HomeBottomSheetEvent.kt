package com.recoder.presentation.ui.newmeeting

sealed class HomeBottomSheetEvent {

	object NavigateToWaitingRoom : HomeBottomSheetEvent()
	object ShowLinkDialog : HomeBottomSheetEvent()
	data class ShowSnackBar(val msg: String) : HomeBottomSheetEvent()
}