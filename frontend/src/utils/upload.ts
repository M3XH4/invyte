export function imageUriToFormData(
  field: string,
  uri: string,
  filename = `upload-${Date.now()}.jpg`,
  mimeType = 'image/jpeg',
) {
  const formData = new FormData();
  const safeMimeType = mimeType || 'image/jpeg';
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
