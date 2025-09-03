import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Zod şeması ile veri doğrulama middleware'i
 * @param schema - Doğrulama şeması
 * @param property - Doğrulanacak request özelliği (body, query, params)
 */
export const validateSchema = (
  schema: ZodSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // İlgili request özelliğini al
      const dataToValidate = req[property];
      
      // Zod safe parse kullanarak doğrula
      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        // Doğrulama hatalarını formatla
        const errors = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors
        });
        return;
      }
      
      // Doğrulanmış veriyi request'e ekle (type assertion kullanarak)
      if (property === 'body') {
        req.body = result.data;
      } else if (property === 'params') {
        req.params = result.data as any;
      } else if (property === 'query') {
        req.query = result.data as any;
      }
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  };
};

/**
 * Multiple şema doğrulama middleware'i
 * Body, query ve params için farklı şemalar kullanabilir
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Array<{
        field: string;
        message: string;
        code: string;
        location: string;
      }> = [];
      
      // Body doğrulama
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          bodyResult.error.issues.forEach(err => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
              location: 'body'
            });
          });
        } else {
          req.body = bodyResult.data;
        }
      }
      
      // Query doğrulama
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          queryResult.error.issues.forEach(err => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
              location: 'query'
            });
          });
        } else {
          req.query = queryResult.data as any;
        }
      }
      
      // Params doğrulama
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          paramsResult.error.issues.forEach(err => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
              location: 'params'
            });
          });
        } else {
          req.params = paramsResult.data as any;
        }
      }
      
      // Hata varsa yanıt döndür
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Multiple validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  };
};

/**
 * ID parametresi doğrulama şeması
 */
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID gereklidir')
});

/**
 * ID doğrulama middleware'i
 */
export const validateIdParam = validateSchema(IdParamSchema, 'params');
