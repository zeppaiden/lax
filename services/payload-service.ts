import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import _ from 'lodash'
import {
  Payload,
  PayloadType,
  Result,
  TableName
} from '@/services/types'

export class PayloadService {
  private readonly supabase: SupabaseClient

  private readonly STORAGE_BUCKET = 'payloads'
  private readonly MINIMUM_FILE_SIZE = 0
  private readonly MAXIMUM_FILE_SIZE = 10485760 // 10MB in bytes

  private readonly payload_schema = z.object({
    message_id: z.string().uuid(),
    created_by: z.string().uuid(),
    file: z.instanceof(File).refine(
      (file) => file.size <= this.MAXIMUM_FILE_SIZE,
      'File size must not exceed 10MB'
    )
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
 
  async createPayload(
    message_id: string,
    created_by: string,
    file: File
  ): Promise<Result<Payload>> {
    try {
      const validated_data = this.payload_schema.parse({
        message_id,
        created_by,
        file
      })

      const timestamp = new Date().toISOString()
      const extension = file.name.split('.').pop() || ''
      const file_name = `${validated_data.message_id}_${timestamp}.${extension}`

      const { data: upload_data, error: upload_error } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .upload(file_name, validated_data.file)

      if (upload_error) {
        return {
          success: false,
          failure: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload file',
            context: upload_error.message
          }
        }
      }

      const { data: payload_data, error: payload_error } = await this.supabase.rpc('fn_create_payload', {
        p_message_id: validated_data.message_id,
        p_created_by: validated_data.created_by,
        p_path: file_name,
        p_type: this.getPayloadType(validated_data.file),
        p_size: validated_data.file.size
      })

      if (payload_error) {
        await this.supabase
          .storage
          .from(this.STORAGE_BUCKET)
          .remove([file_name])

        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create payload',
            context: payload_error.message
          }
        }
      }

      return {
        success: true,
        content: payload_data as Payload
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid payload data',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async selectPayload(
    payload_id: string
  ): Promise<Result<Payload>> {
    try {
      this.uuid_schema.parse(payload_id)

      const { data, error } = await this.supabase
        .from(TableName.PAYLOADS)
        .select()
        .eq('payload_id', payload_id)
        .single()

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve payload',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Payload
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid payload ID format'
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async selectPayloads(
    message_id: string
  ): Promise<Result<Payload[]>> {
    try {
      this.uuid_schema.parse(message_id)

      const { data, error } = await this.supabase
        .from(TableName.PAYLOADS)
        .select()
        .eq('message_id', message_id)
        .order('created_at', { ascending: true })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve payloads',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Payload[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid message ID format'
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async deletePayload(
    payload_id: string
  ): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(payload_id)

      const { data, error } = await this.supabase.rpc('fn_delete_payload', {
        p_payload_id: payload_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete payload',
            context: error.message
          }
        }
      }

      return {
        success: true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid payload ID format'
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async signedPayload(
    payload_id: string
  ): Promise<Result<string>> {
    try {
      const payload = await this.selectPayload(payload_id)

      if (!payload.success || !payload.content) {
        return {
          success: false,
          failure: payload.failure
        }
      }

      const { data, error } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .createSignedUrl(payload.content.path, 3600, {
          download: true
        })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SIGNED_URL_FAILED',
            message: 'Failed to create signed URL',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data.signedUrl
      }
    } catch (error) {
      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  private getPayloadType(file: File): PayloadType {
    const type = file.type.split('/')[0].toLowerCase()
    switch (type) {
      case 'image': return PayloadType.IMAGE
      case 'video': return PayloadType.VIDEO
      case 'audio': return PayloadType.AUDIO
      default: return PayloadType.FILE
    }
  }

  async uploadPayload(
    channel_id: string,
    file: File
  ): Promise<Result<{ path: string }>> {
    try {
      const path = `${channel_id}/${file.name}`
      const { data, error } = await this.supabase
        .storage
        .from('payloads')
        .upload(path, file, {
          upsert: true
        })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload file',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: { path: data.path }
      }
    } catch (error) {
      return {
        success: false,
        failure: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload file',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }
}
