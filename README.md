# Partials

## Section menu

Generates an unordered list of linked page titles from a specified content section.

The `context` and `section_name` params are required as shown below.

    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog")}} }}

The `max` param is optional- limits the number of items to show.
    
    {{ partial "hugo-sundries/section-menu.html" (dict "context" . "section_name" "blog" "max" "5")}} }}