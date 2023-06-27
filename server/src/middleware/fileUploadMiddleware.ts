import { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import CustomAPIError from '../exceptions/CustomAPIError';
import HttpStatus from '../helpers/HttpStatus';

export default function fileUploadMiddleware(options?: formidable.Options) {
  const form = formidable(options);

  return async function (req: Request, res: Response, next: NextFunction) {
    form.parse(req, async (err: any, fields: any, files: any) => {
      return new Promise((resolve, reject) => {
        if (err) return reject(err);

        // Perform file type and size checks
        const uploadedFile = files.profileImageUrl;

        // Check file type
        const allowedFileTypes = ['image/jpeg', 'image/png'];
        if (!allowedFileTypes.includes(uploadedFile.type)) {
          return Promise.reject(CustomAPIError.response('Invalid file type. Only JPEG and PNG files are allowed.', HttpStatus.BAD_REQUEST.code));
        }

        // Check file size
        const maxSizeInBytes = 10 * 1024 * 1024;//10mb
        if (uploadedFile.size > maxSizeInBytes) {
          return Promise.reject(CustomAPIError.response('File size exceeds the allowed limit.', HttpStatus.BAD_REQUEST.code));
        }

        req.fields = fields;
        req.files = files;

        resolve(next());
      });
    });

    next();
  };
};

