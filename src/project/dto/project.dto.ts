import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Matches } from "class-validator";

export class ProjectDto {
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({each: true})
  @Matches(new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/), {each: true})
  urls: string[]
}