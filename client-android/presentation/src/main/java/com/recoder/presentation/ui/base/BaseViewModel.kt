package com.recoder.presentation.ui.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.recoder.presentation.ui.util.MutableEventFlow
import com.recoder.presentation.ui.util.asEventFlow
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

abstract class BaseViewModel<S : UiState, A : UiSideEffect, E : UiEvent>(
	initialState: S,
) : ViewModel() {

	private val _uiState = MutableStateFlow<S>(initialState)
	val uiState = _uiState.asStateFlow()

	private val _event: MutableEventFlow<E> = MutableEventFlow()
	val event = _event.asEventFlow()

	private val _effect: Channel<A> = Channel()
	val effect = _effect.receiveAsFlow()

	private val currentState: S
		get() = _uiState.value

	init {
		subscribeEvents()
	}

	open fun setEvent(event: E) {
		val newEvent = event
		viewModelScope.launch { _event.emit(newEvent) }
	}

	// have to subscribe event flow in initializing view model
	private fun subscribeEvents() = viewModelScope.launch {
		_event.collect() { handleEvent(it) }
	}

	protected abstract suspend fun handleEvent(event: E)

	protected fun setState(reduce: S.() -> S) {
		val state = currentState.reduce()
		_uiState.value = state
	}

	protected fun setEffect(vararg builder: A) {
		for (effectValue in builder) {
			viewModelScope.launch { _effect.send(effectValue) }
		}
	}
}

