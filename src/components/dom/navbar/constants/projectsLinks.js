/* eslint-disable prettier/prettier */
import projects from '@src/constants/projects';

const featuredProjects = projects
  .filter((project) => project.featured)
  .slice(0, 3);
const projectsLinks = (
  featuredProjects.length ? featuredProjects : projects.slice(0, 3)
).map((project) => ({
  title: project.title,
  href: project.link,
}));
export default projectsLinks;
