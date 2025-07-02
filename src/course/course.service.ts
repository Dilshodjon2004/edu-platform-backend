import { Injectable } from '@nestjs/common';
import { CourseBodyDto } from './dto/course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './course.model';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>) {}
  async createCourse(dto: CourseBodyDto, _id: string) {
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const slug = slugify(dto.title);
    return await this.courseModel.create({ ...dto, slug: slug, author: _id });
  }

  async editCourse(dto: CourseBodyDto, courseId: string) {
    return await this.courseModel.findByIdAndUpdate(courseId, dto, { new: true });
  }

  async deleteCourse(courseId: string) {
    await this.courseModel.findByIdAndDelete(courseId);
    return 'success';
  }

  async activateCourse(courseId: string) {
    await this.courseModel.findByIdAndUpdate(courseId, { $set: { isActive: true } }, { new: true });
    return 'success';
  }

  async draftCourse(courseId: string) {
    await this.courseModel.findByIdAndUpdate(
      courseId,
      { $set: { isActive: false } },
      { new: true },
    );
    return 'success';
  }

  async dragCourseSections(courseId: string, sections: string[]) {
    const course = await this.courseModel
      .findByIdAndUpdate(courseId, { $set: { sections } }, { new: true })
      .populate({ path: 'sections', populate: { path: 'lessons' } });

    return course?.sections;
  }
}
