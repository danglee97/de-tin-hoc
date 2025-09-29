import { EducationalLevel, QuestionType, ExamPeriod } from './types';

export const EDUCATIONAL_LEVELS = [
  { value: EducationalLevel.PRIMARY, label: 'Tiểu học' },
  { value: EducationalLevel.SECONDARY, label: 'Trung học cơ sở' },
  { value: EducationalLevel.HIGH_SCHOOL, label: 'Trung học phổ thông' },
];

export const GRADES_BY_LEVEL: Record<EducationalLevel, string[]> = {
  [EducationalLevel.PRIMARY]: ['3', '4', '5'],
  [EducationalLevel.SECONDARY]: ['6', '7', '8', '9'],
  [EducationalLevel.HIGH_SCHOOL]: ['10', '11'],
};

export const QUESTION_TYPES = [
  { value: QuestionType.MULTIPLE_CHOICE, label: 'Trắc nghiệm' },
  { value: QuestionType.TRUE_FALSE, label: 'Đúng/Sai' },
  { value: QuestionType.SHORT_ANSWER, label: 'Trả lời ngắn' },
];

export const EXAM_PERIODS = [
  { value: ExamPeriod.MID_TERM_1, label: 'Giữa học kì 1' },
  { value: ExamPeriod.END_TERM_1, label: 'Cuối học kì 1' },
  { value: ExamPeriod.MID_TERM_2, label: 'Giữa học kì 2' },
  { value: ExamPeriod.END_TERM_2, label: 'Cuối học kì 2' },
];

export const PRIMARY_EXAM_PERIODS = [
  { value: ExamPeriod.END_TERM_1, label: 'Cuối học kì 1' },
  { value: ExamPeriod.END_TERM_2, label: 'Cuối học kì 2' },
];


// Updated lesson data based on provided textbooks.
export const LESSONS_BY_GRADE: Record<string, string[]> = {
  '3': [
    'Chủ đề A: Máy tính và em',
    'Chủ đề B: Mạng máy tính và Internet',
    'Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề D: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề E: Ứng dụng tin học',
    'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính'
  ],
  '4': [
    'Chủ đề A: Máy tính và em',
    'Chủ đề B: Mạng máy tính và Internet',
    'Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề D: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề E: Ứng dụng tin học',
    'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính'
  ],
  '5': [
    'Chủ đề A: Máy tính và em',
    'Chủ đề B: Mạng máy tính và Internet',
    'Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề D: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề E: Ứng dụng tin học',
    'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính'
  ],
  '6': [
    'Chủ đề 1: Máy tính và cộng đồng',
    'Chủ đề 2: Mạng máy tính và Internet',
    'Chủ đề 3: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề 4: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 5: Ứng dụng tin học',
    'Chủ đề 6: Giải quyết vấn đề với sự trợ giúp của máy tính'
  ],
  '7': [
    'Chủ đề 1: Máy tính và cộng đồng',
    'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề 3: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 4: Ứng dụng tin học',
    'Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính'
  ],
  '8': [
    'Chủ đề 1: Máy tính và cộng đồng',
    'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề 3: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 4: Ứng dụng tin học',
    'Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính',
    'Chủ đề 6: Hướng nghiệp với Tin học'
  ],
  '9': [
    'Chủ đề 1: Máy tính và cộng đồng',
    'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề 3: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 4: Ứng dụng tin học',
    'Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính',
    'Chủ đề 6: Hướng nghiệp với tin học'
  ],
  '10': [
    'Chủ đề 1: Máy tính và xã hội tri thức',
    'Chủ đề 2: Mạng máy tính và Internet',
    'Chủ đề 3: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 4: Ứng dụng tin học',
    'Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính',
    'Chủ đề 6: Hướng nghiệp với Tin học'
  ],
  '11': [
    'Chủ đề 1: Máy tính và xã hội tri thức',
    'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    'Chủ đề 3: Đạo đức, pháp luật và văn hoá trong môi trường số',
    'Chủ đề 4: Giới thiệu các hệ cơ sở dữ liệu',
    'Chủ đề 5: Hướng nghiệp với tin học',
    'Chủ đề 6: Thực hành tạo và khai thác cơ sở dữ liệu',
    'Chủ đề 7: Phần mềm chỉnh sửa ảnh và làm video'
  ],
};