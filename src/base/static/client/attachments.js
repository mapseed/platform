const createAttachments = async (placeUrl, attachments) => {
  try {
    const attachmentPromises = [];
    attachments.forEach(async attachment => {
      const formData = new FormData();
      if (attachment.blob) {
        formData.append("file", attachment.blob);
      }
      formData.append("name", attachment.name);
      formData.append("type", attachment.type);
      formData.append("visible", true);

      const response = await fetch(`${placeUrl}/attachments`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      attachmentPromises.push(response.json());
    });

    return await Promise.all(attachmentPromises);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create attachments.", err);
  }
};

const deleteAttachment = async (placeUrl, attachmentId) => {
  try {
    const response = await fetch(`${placeUrl}/attachments/${attachmentId}`, {
      credentials: "include",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visible: false,
      }),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete attachment.", err);
  }
};

export default {
  create: createAttachments,
  delete: deleteAttachment,
};
