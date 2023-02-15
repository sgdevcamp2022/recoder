package com.recoder.presentation.ui.home

import androidx.lifecycle.viewModelScope
import com.recoder.domain.usecase.CreateLinkUseCase
import com.recoder.presentation.ui.base.BaseViewModel
import com.recoder.presentation.ui.base.LoadState
import com.recoder.presentation.ui.base.isSuccessful
import dagger.hilt.android.lifecycle.HiltViewModel
import com.recoder.presentation.ui.home.HomeContract.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor() : BaseViewModel<HomeUiState, HomeUiSideEffect, HomeUiEvent>(HomeUiState()) {

	override suspend fun handleEvent(event: HomeUiEvent) {
		when(event) {
			is HomeUiEvent.OnError -> {
				setState { copy(snackBarText = event.msg) }
				setEffect(HomeUiSideEffect.ShowSnackBar)
			}
		}
	}
}