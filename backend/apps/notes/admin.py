from django.contrib import admin

from .models import Attachment, Note


admin.site.register(Note)
admin.site.register(Attachment)
