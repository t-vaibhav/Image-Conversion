"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as imageConversion from "image-conversion";

const converter = () => {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);

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
    <img id="image1" src={file.preview} className="w-full max-w-md mx-auto rounded-lg shadow-lg" alt="" />
  ));

  async function view(e) {
    setIsConverting(true);
    let newImage = document.getElementById("image1");

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

    // Create a new Image element
    const image = new Image();

    // Set the data URL as the source for the image
    image.src = await getBase64FromUrl(newImage.src);

    // Wait for the image to load
    image.onload = async () => {
      // Create a canvas to work with
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      // Get the canvas context
      const context = canvas.getContext("2d");

      // Draw the image onto the canvas
      context.drawImage(image, 0, 0);
  
      // Convert canvas to data URLs
      const DataUrl = canvas.toDataURL(e,1);
      const res = await imageConversion.urltoBlob(DataUrl)
      imageConversion.downloadFile(res);
      setIsConverting(false);
    };
  }

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Image <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Converter</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Convert your images between popular formats like JPEG, PNG, and WebP with just a few clicks.
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
                    id="image2"
                    accept="image"
                    {...getInputProps({ name: "file" })}
                  />
                  <div className={`grid w-full h-64 border-2 border-dashed rounded-xl justify-items-center place-items-center transition-all duration-300 ${
                    isDragActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {isDragActive ? "Drop your image here" : "Drag & drop your image here"}
                      </p>
                      <p className="text-gray-500">or click to browse files</p>
                      <p className="text-sm text-gray-400 mt-2">Supports: JPG, PNG, GIF, WebP</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">Only 1 image at a time</p>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          {files.length > 0 && (
            <div className="max-w-2xl mx-auto mb-12">
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

          {/* Conversion Buttons */}
          {files.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  Choose Output Format
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                      isConverting 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
                    }`}
                    onClick={() => {
                      if (!isConverting) view("image/jpeg");
                    }}
                    disabled={isConverting}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">JPEG</h3>
                    <p className="text-sm text-gray-600 text-center">Best for photos and complex images</p>
                    {isConverting && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                      </div>
                    )}
                  </button>

                  <button
                    className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                      isConverting 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      if (!isConverting) view("image/png");
                    }}
                    disabled={isConverting}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PNG</h3>
                    <p className="text-sm text-gray-600 text-center">Perfect for graphics with transparency</p>
                    {isConverting && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </button>

                  <button
                    className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                      isConverting 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                    }`}
                    onClick={() => {
                      if (!isConverting) view("image/webp");
                    }}
                    disabled={isConverting}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">WebP</h3>
                    <p className="text-sm text-gray-600 text-center">Modern format for web optimization</p>
                    {isConverting && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default converter;
