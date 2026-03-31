import courses from '../models/course.json';

function Courses() {
  return (
    <div>
      {courses.map((course, index) => (
        <div key={index}>
          <h2>{course.title}</h2>
          <p>{course.platform}</p>
          <a href={course.link} target="_blank">View Course</a>
        </div>
      ))}
    </div>
  );
}