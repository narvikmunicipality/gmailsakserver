CREATE TABLE [dbo].[Log](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ImportTime] [datetime] NOT NULL,
	[MailId] [nvarchar](64) NOT NULL,
	[MailAddress] [nvarchar](64) NOT NULL,
	[MailMetadata] [nvarchar](max) NULL,
	[JournalPostId] [nvarchar](64) NULL,
	[JournalPostDraft] [nvarchar](max) NOT NULL,
	[ExceptionMessage] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Unique ID for each import item.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'Id'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp of when the the import was initiated.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'ImportTime'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Mail address of the authenticated user doing the import.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'MailAddress'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'JournalPostId of the imported message; if it was successful.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'JournalPostId'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'JournalPostDraft that was used in this import.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'JournalPostDraft'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Exceptionmessage while doing import; if any.' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Log', @level2type=N'COLUMN',@level2name=N'ExceptionMessage'
GO