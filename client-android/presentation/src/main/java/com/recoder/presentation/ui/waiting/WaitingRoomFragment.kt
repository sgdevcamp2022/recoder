package com.recoder.presentation.ui.waiting

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.LifecycleOwner
import com.google.common.util.concurrent.ListenableFuture
import com.recoder.presentation.R
import com.recoder.presentation.databinding.FragmentWaitingRoomBinding


private var PERMISSIONS_REQUIRED = arrayOf(Manifest.permission.CAMERA)

class WaitingRoomFragment : Fragment() {


    private lateinit var viewModel: WaitingRoomViewModel
    private lateinit var binding: FragmentWaitingRoomBinding
    private lateinit var getResult: ActivityResultLauncher<Intent>
    private lateinit var cameraProviderFuture : ListenableFuture<ProcessCameraProvider>

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_waiting_room, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.videoToggleButton.setOnClickListener {
            if (!hasPermissions(requireContext()))
                activityResultLauncher.launch(Manifest.permission.CAMERA)
            else setCameraPreview(true)
        }

        cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext())

        cameraProviderFuture.addListener(Runnable {
            val cameraProvider = cameraProviderFuture.get()
            bindPreview(cameraProvider)
        }, ContextCompat.getMainExecutor(requireContext()))

    }

    fun bindPreview(cameraProvider : ProcessCameraProvider) {
        var preview : Preview = Preview.Builder().build()

        var cameraSelector : CameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build()
        preview.setSurfaceProvider(binding.videoPreview.previewView.surfaceProvider)

        var camera = cameraProvider.bindToLifecycle(this as LifecycleOwner, cameraSelector, preview)
    }

    private val activityResultLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) setCameraPreview(true)
            else Toast.makeText(context, "권한 획득 실패", Toast.LENGTH_LONG).show()
        }

    private fun setCameraPreview(isOn: Boolean) {
        val visibility : Int = if(isOn) View.VISIBLE else View.INVISIBLE
        binding.videoPreview.previewView.visibility = visibility
    }
    companion object {
        fun hasPermissions(context: Context) = PERMISSIONS_REQUIRED.all {
            ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
        }
    }

}