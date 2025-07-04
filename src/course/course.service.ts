import { Injectable } from '@nestjs/common';
import { CourseBodyDto } from './dto/course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './course.model';
import { Model } from 'mongoose';
import { Instructor, InstructorDocument } from 'src/instructor/instructor.model';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
  ) {}

  async createCourse(dto: CourseBodyDto, _id: string) {
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const slug = slugify(dto.title);
    const course = await this.courseModel.create({ ...dto, slug: slug, author: _id });
    await this.instructorModel.findByIdAndUpdate(
      { author: _id },
      { $push: { courses: course._id } },
      { new: true },
    );
    return 'success';
  }

  async editCourse(dto: CourseBodyDto, courseId: string) {
    return await this.courseModel.findByIdAndUpdate(courseId, dto, { new: true });
  }

  async deleteCourse(courseId: string, userId: string) {
    await this.courseModel.findByIdAndDelete(courseId);
    await this.instructorModel.findByIdAndUpdate(
      { author: userId },
      { $pull: { courses: courseId } },
      { new: true },
    );
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

  async getCourses(language: string, limit: string) {
    const courses = await this.courseModel
      .find({ language })
      .populate({ path: 'sections', populate: { path: 'lessons' } })
      .populate('author')
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .exec();

    return courses.map(course => this.getSpecificFieldCourse(course));
  }

  getSpecificFieldCourse(course: CourseDocument) {
    return {
      title: course.title,
      previewImage: course.previewImage,
      price: course.price,
      level: course.level,
      author: {
        fullName: course.author.fullName,
        avatar: course.author.avatar,
      },
      lessonCount: course.sections.map(c => c.lessons.length).reduce((a, b) => +a + +b, 0),
      totalHour: this.getTotalHour(course),
    };
  }

  getTotalHour(course: CourseDocument) {
    let totalHour = 0;

    for (let s = 0; s < course.sections.length; s++) {
      const section = course.sections[s];
      let sectionHour = 0;

      for (let l = 0; l < section.lessons.length; l++) {
        const lesson = section.lessons[l];
        const hours = parseInt(String(lesson.hour));
        const minutes = parseInt(String(lesson.minute));
        const seconds = parseInt(String(lesson.second));
        const totalMinutes = hours * 60 + minutes;
        const totalSeconds = totalMinutes * 60 + seconds;
        const totalHourLesson = totalSeconds / 3600;
        sectionHour += totalHourLesson;
      }

      totalHour += sectionHour;
    }

    return totalHour.toFixed(0);
  }
}
