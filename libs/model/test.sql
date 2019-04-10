USE [master]
GO
/****** Object:  Database [ChatEDriver]    Script Date: 4/1/2019 2:50:48 PM ******/
CREATE DATABASE [ChatEDriver]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'ChatEDriver', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\DATA\ChatEDriver.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'ChatEDriver_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\DATA\ChatEDriver_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [ChatEDriver] SET COMPATIBILITY_LEVEL = 140
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ChatEDriver].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ChatEDriver] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ChatEDriver] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ChatEDriver] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ChatEDriver] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ChatEDriver] SET ARITHABORT OFF 
GO
ALTER DATABASE [ChatEDriver] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [ChatEDriver] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ChatEDriver] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ChatEDriver] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ChatEDriver] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ChatEDriver] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ChatEDriver] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ChatEDriver] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ChatEDriver] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ChatEDriver] SET  DISABLE_BROKER 
GO
ALTER DATABASE [ChatEDriver] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ChatEDriver] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ChatEDriver] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ChatEDriver] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ChatEDriver] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ChatEDriver] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ChatEDriver] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ChatEDriver] SET RECOVERY FULL 
GO
ALTER DATABASE [ChatEDriver] SET  MULTI_USER 
GO
ALTER DATABASE [ChatEDriver] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ChatEDriver] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ChatEDriver] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ChatEDriver] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ChatEDriver] SET DELAYED_DURABILITY = DISABLED 
GO
EXEC sys.sp_db_vardecimal_storage_format N'ChatEDriver', N'ON'
GO
ALTER DATABASE [ChatEDriver] SET QUERY_STORE = OFF
GO
USE [ChatEDriver]
GO
/****** Object:  User [ntduong]    Script Date: 4/1/2019 2:50:48 PM ******/
CREATE USER [ntduong] FOR LOGIN [ntduong] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [duongnt]    Script Date: 4/1/2019 2:50:48 PM ******/
CREATE USER [duongnt] FOR LOGIN [duongnt] WITH DEFAULT_SCHEMA=[duongnt]
GO
ALTER ROLE [db_owner] ADD MEMBER [duongnt]
GO
/****** Object:  Schema [duongnt]    Script Date: 4/1/2019 2:50:49 PM ******/
CREATE SCHEMA [duongnt]
GO
/****** Object:  Table [dbo].[Message]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Message](
	[Message_ID] [varchar](256) NOT NULL,
	[Sender_ID] [varchar](256) NULL,
	[Room_ID] [varchar](256) NULL,
	[Message] [nvarchar](max) NULL,
	[Type] [nvarchar](50) NULL,
	[Created] [time](7) NULL,
	[Status] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_Message] PRIMARY KEY CLUSTERED 
(
	[Message_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Room]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Room](
	[Room_ID] [varchar](256) NOT NULL,
	[Room_Name] [nchar](50) NULL,
	[Created] [time](7) NULL,
	[Status] [nvarchar](max) NULL,
 CONSTRAINT [PK_Room] PRIMARY KEY CLUSTERED 
(
	[Room_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Store_Media]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Store_Media](
	[Media_ID] [uniqueidentifier] NULL,
	[Data] [varbinary](max) NULL,
	[Message_ID] [uniqueidentifier] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[User_ID] [varchar](256) NOT NULL,
	[Username] [nvarchar](50) NULL,
	[Password] [nvarchar](50) NULL,
	[Avatar] [nvarchar](50) NULL,
	[Status] [nvarchar](max) NULL,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[User_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Admin]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Admin](
	[Admin_ID] [varchar](256) NOT NULL,
	[User_ID] [varchar](256) NULL,
 CONSTRAINT [PK_User_Admin] PRIMARY KEY CLUSTERED 
(
	[Admin_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Room]    Script Date: 4/1/2019 2:50:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Room](
	[User_Room_ID] [uniqueidentifier] NOT NULL,
	[User_ID] [varchar](256) NULL,
	[Room_ID] [varchar](256) NULL,
	[Status] [nvarchar](max) NULL,
 CONSTRAINT [PK_User_Room] PRIMARY KEY CLUSTERED 
(
	[User_Room_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
USE [master]
GO
ALTER DATABASE [ChatEDriver] SET  READ_WRITE 
GO
