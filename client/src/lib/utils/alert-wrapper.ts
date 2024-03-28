import { renderAlert } from '@jaspero/web-components/dist/render-alert.js';

export async function alertWrapper(
  request: Promise<any>,
  successMessage = '',
  errorMessage?: (e: any) => void,
  onError?: () => void
) {
  let resp;
  try {
    resp = await request;

    if (resp.error) {
      if (onError) {
        onError();
      }

      await renderAlert({ title: 'Error', message: resp.error, state: 'error' });
    }
    if (successMessage && !resp.error) {
      console.log('successMessage', successMessage);
      await renderAlert({ title: 'Success', message: successMessage, state: 'success' });
    }
  } catch (e: any) {
    console.log('errorMessage', errorMessage);
    if (onError) {
      onError();
    }

    throw e;
  }

  return resp;
}