const createAttachment = async (placeUrl, attachment) => {
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
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create attachments.", response.statusText);

    return null;
  }

  return await response.json();
};

const deleteAttachment = async (placeUrl, attachmentId) => {
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
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete attachment.", response.statusText);

    return null;
  }

  return await response.json();
};

export default {
  create: createAttachment,
  delete: deleteAttachment,
};
