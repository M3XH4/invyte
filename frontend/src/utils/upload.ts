export function imageUriToFormData(
  field: string,
  uri: string,
  filename = `upload-${Date.now()}.jpg`,
  mimeType = 'image/jpeg',
) {
  if (!uri || uri.includes('{')) {
    throw new Error('A valid image URI is required.');
  }

  const formData = new FormData();
  const inferredMimeType = inferMimeType(uri, mimeType);
  const safeMimeType = inferredMimeType || 'image/jpeg';
  const extension = safeMimeType.includes('png')
    ? 'png'
    : safeMimeType.includes('webp')
      ? 'webp'
      : 'jpg';
  const safeFilename = filename || `cover-${Date.now()}.${extension}`;

  formData.append(field, {
    uri,
    name: safeFilename,
    type: safeMimeType,
  } as any);

  if (typeof __DEV__ === 'undefined' || __DEV__) {
    console.log('[upload] prepared image form data', {
      field,
      uri,
      name: safeFilename,
      type: safeMimeType,
    });
  }

  return formData;
}

export function inferMimeType(uri: string, fallback = 'image/jpeg') {
  const cleanUri = uri.split('?')[0].toLowerCase();
  if (cleanUri.endsWith('.png')) return 'image/png';
  if (cleanUri.endsWith('.webp')) return 'image/webp';
  if (cleanUri.endsWith('.jpg') || cleanUri.endsWith('.jpeg')) return 'image/jpeg';
  return fallback;
}
