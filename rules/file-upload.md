# Rule: File Upload & Streaming

## Why It Matters
Unvalidated file uploads are a top attack vector. Missing size limits cause memory exhaustion. Trusting client filenames enables path traversal.

## Rules

- Use `FileInterceptor` / `FilesInterceptor` with `@UploadedFile()` / `@UploadedFiles()`.
- Always validate file type and size with `ParseFilePipe`.
- Never trust client-provided filenames — sanitize or generate new ones.
- Set file size limits to prevent abuse.
- For Fastify, use `@fastify/multipart` instead of Multer.

## Single File Upload

```typescript
@Post('avatar')
@UseInterceptors(FileInterceptor('file'))
uploadAvatar(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
      ],
    }),
  )
  file: Express.Multer.File,
): Promise<UploadResponseDto> {
  return this.uploadService.saveAvatar(file);
}
```

## Streaming Files (Download)

```typescript
@Get('report/:id')
async downloadReport(
  @Param('id', ParseUUIDPipe) id: string,
): Promise<StreamableFile> {
  const stream = await this.reportsService.getReportStream(id);
  return new StreamableFile(stream, {
    type: 'application/pdf',
    disposition: `attachment; filename="report-${id}.pdf"`,
  });
}
```

## Storage Configuration

```typescript
MulterModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    dest: config.get('UPLOAD_DIR'),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB global limit
  }),
  inject: [ConfigService],
}),
```
