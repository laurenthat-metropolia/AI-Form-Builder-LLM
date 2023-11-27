import { Controller, Delete, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConsumerTopics } from '../event-consumers/consumer-topics';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { forms } from '../services/form.service';

@ApiTags('Form Fields')
@Controller('forms/:formId/fields')
export class FormFieldController {
    constructor(@InjectQueue(ConsumerTopics.FormCreated) private imageEventsQueue: Queue) {}

    @Post('text-field')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create TextField',
        description: 'Create TextField',
    })
    async createFormTextfield(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('text-field/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'TextField Id',
    })
    @ApiOperation({
        summary: 'Update TextField',
        description: 'Update TextField',
    })
    async updateFormTextField(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('text-field/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'TextField Id',
    })
    @ApiOperation({
        summary: 'Delete TextField',
        description: 'Delete TextField',
    })
    async deleteFormTextfield(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Post('label')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create Label',
        description: 'Create Label',
    })
    async createFormLabel(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('label/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Label Id',
    })
    @ApiOperation({
        summary: 'Update Label',
        description: 'Update Label',
    })
    async updateFormLabel(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('label/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Label Id',
    })
    @ApiOperation({
        summary: 'Delete Label',
        description: 'Delete Label',
    })
    async deleteFormLabel(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Post('checkbox')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create Checkbox',
        description: 'Create Checkbox',
    })
    async createCheckbox(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('checkbox/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Checkbox Id',
    })
    @ApiOperation({
        summary: 'Update Checkbox',
        description: 'Update Checkbox',
    })
    async updateCheckbox(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('checkbox/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Checkbox Id',
    })
    @ApiOperation({
        summary: 'Delete Checkbox',
        description: 'Delete Checkbox',
    })
    async deleteCheckbox(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Post('toggle-switch')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create ToggleSwitch',
        description: 'Create ToggleSwitch',
    })
    async createToggleSwitch(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('toggle-switch/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'ToggleSwitch Id',
    })
    @ApiOperation({
        summary: 'Update ToggleSwitch',
        description: 'Update ToggleSwitch',
    })
    async updateToggleSwitch(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('toggle-switch/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'ToggleSwitch Id',
    })
    @ApiOperation({
        summary: 'Delete ToggleSwitch',
        description: 'Delete ToggleSwitch',
    })
    async deleteToggleSwitch(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Post('button')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create Button',
        description: 'Create Button',
    })
    async createFormButton(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('button/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Button Id',
    })
    @ApiOperation({
        summary: 'Update Button',
        description: 'Update Button',
    })
    async updateFormButton(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('button/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Button Id',
    })
    @ApiOperation({
        summary: 'Delete Button',
        description: 'Delete Button',
    })
    async deleteFormButton(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Post('image')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiOperation({
        summary: 'Create Image',
        description: 'Create Image',
    })
    async createImage(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Put('image/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Image Id',
    })
    @ApiOperation({
        summary: 'Update Image',
        description: 'Update Image',
    })
    async updateImage(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }

    @Delete('image/:id')
    @ApiParam({
        name: 'formId',
        type: 'string',
        description: 'Form Id',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Image Id',
    })
    @ApiOperation({
        summary: 'Delete Image',
        description: 'Delete Image',
    })
    async deleteImage(@Param() params: Record<string, string>) {
        const formId = params.id;
        const item = await forms.findOnePopulatedById(formId);
        if (!item) {
            throw new NotFoundException();
        }
    }
}
