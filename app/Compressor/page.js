"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as imageConversion from "image-conversion";

const compressor = () => {
  const [files, setFiles] = useState([]);
  const [properties, setProperties] = useState({
    size: 0,
    type: "",
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetSize, setTargetSize] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFiles((previousFiles) => [
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
  });

  const image = files?.map((file) => (
    <img id="image" src={file.preview} className="w-full max-w-md mx-auto rounded-lg shadow-lg" alt="" />
  ));

  const DisplaySize = (
    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Current Size:</span>
        <span className="text-2xl font-bold text-green-600">{properties.size} KB</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Format: {properties.type || "Unknown"}
      </div>
    </div>
  );

  const imageProcess = async () => {
    let newImage = document.getElementById("image");
    if (!newImage) return null;

    const getBase64FromUrl = async (url) => {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      });
    };

    const resPromise = new Promise(async (resolve) => {
      try {
        // Create a new Image element
        const image = new Image();
        image.crossOrigin = "anonymous";

        // Set the data URL as the source for the image
        const dataUrl = await getBase64FromUrl(newImage.src);
        image.src = dataUrl;

        // Extract MIME type from data URL
        const mimeTypeMatch = dataUrl.match(/^data:([^;]+)/);
        let mimeType = "image/jpeg"; // default fallback

        if (mimeTypeMatch && mimeTypeMatch[1]) {
          mimeType = mimeTypeMatch[1];
        }

        // Calculate size based on actual data URL length
        const base64Data = dataUrl.split(',')[1];
        const stringLength = base64Data.length;
        const sizeInKb = Math.round((stringLength * 0.75) / 1024);

        setProperties({
          size: sizeInKb,
          type: mimeType,
        });

        image.onload = async () => {
          try {
            // Create a canvas to work with
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;

            // Get the canvas context
            const context = canvas.getContext("2d");

            // For PNG images, ensure transparency is preserved
            if (mimeType === "image/png") {
              // Clear canvas with transparent background
              context.clearRect(0, 0, canvas.width, canvas.height);
            } else {
              // For JPEG, fill with white background
              context.fillStyle = "#FFFFFF";
              context.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw the image onto the canvas
            context.drawImage(image, 0, 0);

            // Convert canvas to data URL with appropriate quality
            const quality = mimeType === "image/png" ? 1.0 : 0.9;
            const canvasDataUrl = canvas.toDataURL(mimeType, quality);
            
            // Convert to blob
            const res = await imageConversion.urltoBlob(canvasDataUrl);
            resolve(res);
          } catch (error) {
            console.error("Error processing image:", error);
            resolve(null);
          }
        };

        image.onerror = () => {
          console.error("Error loading image");
          resolve(null);
        };
      } catch (error) {
        console.error("Error in imageProcess:", error);
        resolve(null);
      }
    });

    return resPromise;
  };

  useEffect(() => {
    if (document.getElementById("image") !== null) {
      imageProcess();
    }
  }, [files]);

  async function view() {
    if (!targetSize || targetSize <= 0) {
      alert("Please enter a valid target size");
      return;
    }
    
    if (parseInt(targetSize) > properties.size) {
      alert("Target size cannot be larger than current size");
      return;
    }

    setIsCompressing(true);
    
    try {
      const res = await imageProcess();
      if (!res) {
        throw new Error("Failed to process image");
      }

      const compressedImage = await imageConversion.compressAccurately(res, {
        size: parseInt(targetSize),
        accuracy: 0.99,
        type: properties.type,
      });
      
      imageConversion.downloadFile(compressedImage);
    } catch (error) {
      console.error("Compression error:", error);
      alert("Error compressing image. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Image <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Compressor</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reduce image file sizes without losing quality. Perfect for web optimization and storage management.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Upload Your Image
              </h2>
              
              <form className="w-full" action="">
                <div {...getRootProps()}>
                  <input
                    type="file"
                    accept="image"
                    {...getInputProps({ name: "file" })}
                  />
                  <div className={`grid w-full h-64 border-2 border-dashed rounded-xl justify-items-center place-items-center transition-all duration-300 ${
                    isDragActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {isDragActive ? "Drop your image here" : "Drag & drop your image here"}
                      </p>
                      <p className="text-gray-500">or click to browse files</p>
                      <p className="text-sm text-gray-400 mt-2">Supports: JPG, PNG</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Only 1 image at a time</p>
                  <p className="text-sm text-gray-500">Can only compress JPEG and PNG types</p>
                </div>
              </form>
            </div>
          </div>

          {/* Main Content */}
          {files.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Left Column - Controls */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Compression Settings
                  </h2>
                  
                  {DisplaySize}
                  
                  <div className="mt-8 space-y-6">
                    <div>
                      <label htmlFor="size" className="block text-lg font-medium text-gray-900 mb-3">
                        Target Size (KB)
                      </label>
                      <div className="relative">
                        <input
                          id="size"
                          type="number"
                          placeholder="Enter target size in KB"
                          value={targetSize}
                          onChange={(e) => setTargetSize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500">KB</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Enter a size smaller than {properties.size} KB
                      </p>
                    </div>

                    <button
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                        isCompressing || !targetSize || parseInt(targetSize) >= properties.size
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                      }`}
                      onClick={view}
                      disabled={isCompressing || !targetSize || parseInt(targetSize) >= properties.size}
                    >
                      {isCompressing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Compressing...
                        </div>
                      ) : (
                        'Compress Image'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  Image Preview
                </h2>
                <div className="flex justify-center">
                  {image}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default compressor;
