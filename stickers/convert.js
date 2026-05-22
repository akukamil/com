const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


file_name_index=0

function process_folder(folder_name){
	
	
	// Source and target directories
	const sourceFolder = './src/'+folder_name; // Replace with your source folder path
	const targetFolder = './'; // Replace with your target folder path


	
	// Ensure the target folder exists
	if (!fs.existsSync(targetFolder)) {
	  fs.mkdirSync(targetFolder);
	}

	// Resize options
	const width = 128; // Desired width
	const height = 128; // Desired height

	// Function to process files
	fs.readdir(sourceFolder, (err, files) => {
		
	  if (err) {
		console.error('Error reading source folder:', err);
		return;
	  }

	  files.forEach((file) => {
		const sourceFilePath = path.join(sourceFolder, file);
		
		// Determine the output file name and extension
		const extension = path.extname(file).toLowerCase();
		let targetFilePath;

		if (extension === '.webp') {
		  // Convert .webp to .png
		  targetFilePath = targetFolder+`${file_name_index}.png`;
		} else if (['.jpg', '.jpeg', '.png'].includes(extension)) {
		  // Keep original extension for other image types
		  targetFilePath = targetFolder+`${file_name_index}.png`;
		} else {
		  console.log(`Skipping unsupported file: ${file}`);
		  return;
		}

		// Process the image
		sharp(sourceFilePath)
		  .resize(width, height, {fit: 'contain',background: { r: 255, g: 255, b: 255, alpha: 0 }})
		  .toFile(targetFilePath, (err, info) => {
			if (err) {
			  console.error(`Error processing image ${file}:`, err);
			} else {
			  console.log(`Processed image ${file}:`, info);
			}
		});
		
		file_name_index++
		
	  });
	});
	
}

process_folder("emojies")
process_folder("got")
process_folder("rick_and_morti")
