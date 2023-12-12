import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString} from "class-validator";

export class ChengePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
     _id: string;

     @IsString()
     @IsNotEmpty()

    @ApiProperty()
    readonly password: string;
}