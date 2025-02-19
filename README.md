# Views Megarow
    Dynamically display content below a row of a table of results coming from a view

    Views megarow is a module letting you display menu callback between two results of a view.
    This content is shown when you click on a link, it means that you can display anything from a preview of your node for instance to a moderation form of an entity.

    The module can be used in order to preview content, build quick edit forms, display more complex forms without having to go to a dedicated page.

    You can use it to display a preview of your node or to build an administrative form.

## Initial version
    This a port of the Drupal version 7.x-1.7

## Compatibility notes:
    This module overrides by default the node/%node/edit and user/%user/edit paths
    in order to provide the best experience to its users out of the box.
    If you need to override those paths from your module, you can disable the
    overriding behaviour from the configuration page.

## Requirements:


## Installation:
Install this module using the official Backdrop CMS instructions at https://docs.backdropcms.org/documentation/extend-with-modules

## Documentation:
    ### In order to use it:

    1. Create a new view
    2. Select the "Megarow table" format
    3. Add a "Megarow links" field
    4. In this field enter one megarow link per line, the structure of a link is the link title and its path joined with a pipe sign (|) (eg: Preview|node/1).
    5. Save your view and display your table
    6. When you will click on a link, Drupal will load what's behind this page and will render it as the megarow content below the current result of the view.

    Views megarow has been designed to let you render forms in the megarow, meaning that you can have validation functions that will block the form submission and once the form is properly submitted the line of results can be refreshed to display the new values.

    Out of the box you don't have an example of this feature, have a look to [Commerce Backoffice] (https://github.com/backdrop-contrib/commerce_backoffice) to see an example of this implementation.

## TODO - Add documentation
    Additional documentation is located in the Wiki: https://github.com/backdrop-contrib/views_megarow/wiki

## Issues:
    Bugs and Feature requests should be reported in the Issue Queue: https://github.com/backdrop-contrib/views_megarow/issues

    PANELS USERS : (This module has not been ported to Backdrop)
    This module overrides by default the node/%node/edit and user/%user/edit menu callbacks. If you plan to override it with Panels, please disable this override in the configuration page admin/config/user-interface/views_megarow.


## Current Maintainer(s):
    - [Steve Moorhouse (albanycomputers)] (https://github.com/albanycomputers)
    - Seeking additional maintainers and contributors.

## Credits:

    [Drupal Views Megarows] (https://www.drupal.org/project/views_megarow/)

## Sponsorship:
    - [Albany Computer Services] (https://www.albany-computers.co.uk)
    - [Albany Web Design] (https://www.albanywebdesign.co.uk)
    - [Albany Hosting] (https://www.albany-hosting.co.uk)

## License
    This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.
