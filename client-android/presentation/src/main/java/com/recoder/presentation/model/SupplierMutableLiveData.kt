package com.recoder.presentation.model

import androidx.lifecycle.MutableLiveData
import java.util.function.Supplier

public class SupplierMutableLiveData<T>(supplier: Supplier<T>): MutableLiveData<T>() {

	init { setValue(supplier.get()) }

	interface Invoker<T> { fun invokeAction(value: T) }

	fun postValue(invoker: Invoker<T>) {
		val value : T? = this.value
		invoker.invokeAction(value!!)
		postValue(value)
	}
}