/**
 * Global utility functions for Menutech project
 */

/**
 * Resizes an image file to a specified maximum width and height while maintaining aspect ratio.
 * @param {File} file - The image file to resize.
 * @param {number} maxWidth - The maximum width allowed.
 * @param {number} maxHeight - The maximum height allowed.
 * @returns {Promise<File>} - A promise that resolves with the resized File object.
 */
export async function resizeImage(file, maxWidth = 500, maxHeight = 500) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(resizedFile);
                }, file.type);
            };
        };
        reader.onerror = (error) => reject(error);
    });
}
