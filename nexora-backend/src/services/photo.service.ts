import prisma from "../config/prisma";
import { refreshProfileCompletion } from "./profile.service";

interface PhotoRecord {
  id: number | bigint;
  user_id: number | bigint;
  url: string;
  position: number;
  is_verified: number | boolean;
  created_at: Date;
}

const parseUserId = (userId: string): bigint => {
  try {
    return BigInt(userId);
  } catch {
    throw new Error("Invalid user ID");
  }
};

const parsePhotoId = (photoId: string): bigint => {
  try {
    const id = BigInt(photoId);

    if (id <= 0n) {
      throw new Error();
    }

    return id;
  } catch {
    throw new Error("Invalid photo ID");
  }
};

const mapPhoto = (photo: PhotoRecord) => ({
  id: Number(photo.id),
  userId: Number(photo.user_id),
  url: photo.url,
  position: photo.position,
  isVerified: Boolean(photo.is_verified),
  createdAt: photo.created_at,
});

export const getMyPhotos = async (userId: string) => {
  const numericUserId = parseUserId(userId);

  const photos = await prisma.$queryRaw<PhotoRecord[]>`
    SELECT
      id,
      user_id,
      url,
      position,
      is_verified,
      created_at
    FROM photos
    WHERE user_id = ${numericUserId}
    ORDER BY position ASC, id ASC
  `;

  return photos.map(mapPhoto);
};

export const addMyPhoto = async (
  userId: string,
  url: unknown,
  position?: unknown
) => {
  const numericUserId = parseUserId(userId);

  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Photo URL is required");
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length > 500) {
    throw new Error("Photo URL cannot exceed 500 characters");
  }

  if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
    throw new Error("Please provide a valid photo URL");
  }

  const existingPhotos = await prisma.$queryRaw<
    { id: number | bigint; position: number }[]
  >`
    SELECT id, position
    FROM photos
    WHERE user_id = ${numericUserId}
    ORDER BY position ASC, id ASC
  `;

  let newPosition: number;

  if (
    position === undefined ||
    position === null ||
    position === ""
  ) {
    newPosition =
      existingPhotos.length === 0
        ? 0
        : Math.max(
            ...existingPhotos.map((photo) => photo.position)
          ) + 1;
  } else {
    const parsedPosition = Number(position);

    if (
      !Number.isInteger(parsedPosition) ||
      parsedPosition < 0
    ) {
      throw new Error(
        "Position must be a non-negative integer"
      );
    }

    newPosition = parsedPosition;
  }

  if (newPosition === 0 && existingPhotos.length > 0) {
    await prisma.$executeRaw`
      UPDATE photos
      SET position = position + 1
      WHERE user_id = ${numericUserId}
    `;
  }

  if (newPosition > 0) {
    await prisma.$executeRaw`
      UPDATE photos
      SET position = position + 1
      WHERE user_id = ${numericUserId}
        AND position >= ${newPosition}
    `;
  }

  await prisma.$executeRaw`
    INSERT INTO photos (
      user_id,
      url,
      position,
      is_verified
    )
    VALUES (
      ${numericUserId},
      ${trimmedUrl},
      ${newPosition},
      FALSE
    )
  `;

  const createdPhotos = await prisma.$queryRaw<PhotoRecord[]>`
    SELECT
      id,
      user_id,
      url,
      position,
      is_verified,
      created_at
    FROM photos
    WHERE user_id = ${numericUserId}
      AND url = ${trimmedUrl}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (createdPhotos.length === 0) {
    throw new Error("Unable to create photo");
  }

  // Recalculate profile completion after adding photo.
  await refreshProfileCompletion(userId);

  return mapPhoto(createdPhotos[0]);
};

export const makeMyPhotoPrimary = async (
  userId: string,
  photoId: string
) => {
  const numericUserId = parseUserId(userId);
  const numericPhotoId = parsePhotoId(photoId);

  const existingPhoto = await prisma.$queryRaw<
    { id: number | bigint; position: number }[]
  >`
    SELECT id, position
    FROM photos
    WHERE id = ${numericPhotoId}
      AND user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingPhoto.length === 0) {
    throw new Error("Photo not found");
  }

  const currentPosition = existingPhoto[0].position;

  if (currentPosition !== 0) {
    await prisma.$executeRaw`
      UPDATE photos
      SET position = position + 1
      WHERE user_id = ${numericUserId}
        AND position < ${currentPosition}
    `;

    await prisma.$executeRaw`
      UPDATE photos
      SET position = 0
      WHERE id = ${numericPhotoId}
        AND user_id = ${numericUserId}
    `;
  }

  return getMyPhotos(userId);
};

export const deleteMyPhoto = async (
  userId: string,
  photoId: string
) => {
  const numericUserId = parseUserId(userId);
  const numericPhotoId = parsePhotoId(photoId);

  const existingPhoto = await prisma.$queryRaw<
    { id: number | bigint; position: number }[]
  >`
    SELECT id, position
    FROM photos
    WHERE id = ${numericPhotoId}
      AND user_id = ${numericUserId}
    LIMIT 1
  `;

  if (existingPhoto.length === 0) {
    throw new Error("Photo not found");
  }

  const deletedPosition = existingPhoto[0].position;

  await prisma.$executeRaw`
    DELETE FROM photos
    WHERE id = ${numericPhotoId}
      AND user_id = ${numericUserId}
  `;

  await prisma.$executeRaw`
    UPDATE photos
    SET position = position - 1
    WHERE user_id = ${numericUserId}
      AND position > ${deletedPosition}
  `;

  // Recalculate after deleting photo.
  await refreshProfileCompletion(userId);

  return getMyPhotos(userId);
};