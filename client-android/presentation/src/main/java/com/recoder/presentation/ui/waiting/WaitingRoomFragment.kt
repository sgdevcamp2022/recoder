package com.recoder.presentation.ui.waiting

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.LifecycleOwner
import com.google.android.material.snackbar.Snackbar
import com.google.common.util.concurrent.ListenableFuture
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentWaitingRoomBinding


class WaitingRoomFragment : Fragment() {

    companion object {
        private val PERMISSION_CAMERA = Manifest.permission.CAMERA
        private val PERMISSION_RECORD_AUDIO = Manifest.permission.RECORD_AUDIO
        private fun hasPermissions(context: Context, permission: String) =
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }

    private lateinit var viewModel: WaitingRoomViewModel
    private lateinit var binding: FragmentWaitingRoomBinding
    private lateinit var cameraProviderFuture: ListenableFuture<ProcessCameraProvider>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_waiting_room, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.videoToggleButton.setOnClickListener { previewCamera() }
        binding.micToggleButton.setOnClickListener { enableAudio() }


        cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext())
        cameraProviderFuture.addListener(Runnable {
            val cameraProvider = cameraProviderFuture.get()
            bindPreview(cameraProvider)
        }, ContextCompat.getMainExecutor(requireContext()))
    }

    private fun enableAudio() {
        if (!hasPermissions(requireContext(), PERMISSION_RECORD_AUDIO)) {
            activityResultLauncher.launch(PERMISSION_RECORD_AUDIO)
        } else {
            binding.videoToggleIcon.isSelected = false
        }
    }

    private fun previewCamera() {
        if (!hasPermissions(requireContext(), PERMISSION_CAMERA)) {
            activityResultLauncher.launch(PERMISSION_CAMERA)
        } else {
            setCameraPreview(true)
            binding.videoToggleIcon.isSelected = true
        }
    }

    private val activityResultLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) setCameraPreview(true)
            else showSnackBar("카메라 권환 획득 실패")
        }

    private fun bindPreview(cameraProvider: ProcessCameraProvider) {
        var preview: Preview = Preview.Builder().build()

        var cameraSelector: CameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build()
        preview.setSurfaceProvider(binding.videoPreview.previewView.surfaceProvider)

        var camera = cameraProvider.bindToLifecycle(this as LifecycleOwner, cameraSelector, preview)
    }


    private fun setCameraPreview(isOn: Boolean) {
        val visibility: Int = if (isOn) View.VISIBLE else View.INVISIBLE
        binding.videoPreview.previewView.visibility = visibility
    }

    private fun showSnackBar(text: String) {
        Snackbar.make(binding.root, text, Snackbar.LENGTH_SHORT).show()
    }
}